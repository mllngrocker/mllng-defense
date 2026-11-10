"""월드 지도 그림 만들기 → assets/ui/world_map.png (480x540, 도트 느낌으로 240x270을 2배 확대)
1장 지역(마을·초원·언덕·숲·사막 3장)은 대륙 가운데에 작게 모여 있고, 아직 못 가는 땅은 구름으로 덮는다.
지역마다 그림을 따로 그린다: 마을 집·밀밭, 초원 풀숲, 언덕 벚꽃나무·꽃, 숲 나무, 사막 야자수·오아시스,
협곡 절벽, 폐허 부서진 기둥·해골. 지역 사이 흙길, 강과 다리, 북쪽 설산, 서쪽 바다의 해저 신전.
지역 표시(이름·잠금)는 게임(map_view.gd)이 위에 그린다. 위치는 아래 SEEDS와 map_view.gd의 REGIONS "pos"를 맞춘다.
실행: python tools/make_world_map.py   (numpy, Pillow 필요)
"""
import os
import numpy as np
from PIL import Image

W, H = 240, 270
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "ui", "world_map.png")

# 지역 중심(0~1). map_view.gd REGIONS의 pos와 같게.
SEEDS = {
    "village": (0.37, 0.52), "field": (0.45, 0.57), "hill": (0.50, 0.46), "forest": (0.59, 0.51),
    "desert": (0.69, 0.53), "desert2": (0.77, 0.62), "desert3": (0.69, 0.71),
    # 1장 남쪽
    "swamp": (0.37, 0.64), "waterfall": (0.27, 0.62), "beach": (0.33, 0.79), "ruinvillage": (0.47, 0.69), "crystalcave": (0.50, 0.80),
    # 4장
    "lava": (0.80, 0.78), "hell": (0.67, 0.87),
}
ROUTE = ["village", "field", "hill", "forest", "desert", "desert2", "desert3", "lava", "hell"]
TEMPLE = (0.12, 0.50)
SNOW = (0.38, 0.24)
REACH = 17.0  # 지역 하나가 차지하는 반지름(칸)


def fbm(seed, scales=(5, 10, 20, 40), weights=(0.5, 0.25, 0.15, 0.1)):
    rng = np.random.default_rng(seed)
    out = np.zeros((H, W))
    for s, w in zip(scales, weights):
        r = rng.random((max(2, H * s // 240), max(2, W * s // 240)))
        im = Image.fromarray((r * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
        out += np.asarray(im, dtype=float) / 255.0 * w
    return out / sum(weights)


def C(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.uint8)


def grow(mask, n=1):
    m = mask.copy()
    for _ in range(n):
        g = m.copy()
        g[1:, :] |= m[:-1, :]
        g[:-1, :] |= m[1:, :]
        g[:, 1:] |= m[:, :-1]
        g[:, :-1] |= m[:, 1:]
        m = g
    return m


def px(pos):
    return pos[0] * W, pos[1] * H


yy, xx = np.mgrid[0:H, 0:W]
u, v = xx / W, yy / H
n1, n2, n3 = fbm(3), fbm(8), fbm(13, (30, 60), (0.6, 0.4))

# ── 땅·바다 ──
d = np.sqrt(((u - 0.56) / 0.40) ** 2 + ((v - 0.50) / 0.42) ** 2)
land = d + (n1 - 0.5) * 0.9 < 1.0
for cx, cy, r in [(0.13, 0.84, 0.05), (0.86, 0.93, 0.045), (0.22, 0.12, 0.04), (0.93, 0.18, 0.03), (0.06, 0.30, 0.03)]:
    land |= np.sqrt((u - cx) ** 2 + (v - cy) ** 2) + (n2 - 0.5) * 0.06 < r
land &= np.sqrt((u - TEMPLE[0]) ** 2 + (v - TEMPLE[1]) ** 2) > 0.11

# ── 강: 설산 호수에서 마을 서쪽을 지나 바다로 ──
river = np.zeros((H, W), bool)
p = np.array([0.43 * W, 0.31 * H])
goal = np.array([0.05 * W, 0.70 * H])
t, n = 0.0, 0
pts = []
while np.linalg.norm(goal - p) > 1 and n < 3000:
    dv = (goal - p) / np.linalg.norm(goal - p)
    p = p + (dv + np.array([-dv[1], dv[0]]) * np.sin(t) * 0.9) * 0.6
    t += 0.1
    n += 1
    pts.append(p.copy())
for i, q in enumerate(pts):
    w = 0.9 + 1.4 * i / len(pts)
    river |= (xx - q[0]) ** 2 + (yy - q[1]) ** 2 <= w * w
lake = np.sqrt(((u - 0.46) / 0.05) ** 2 + ((v - 0.32) / 0.028) ** 2) + (n2 - 0.5) * 0.5 < 1.0
inland_water = (river | lake) & land
ground = land & ~inland_water
sea = ~land

# ── 지역 나누기: 흔든 좌표로 가장 가까운 지역 ──
wx = xx + (n1 - 0.5) * 26
wy = yy + (n2 - 0.5) * 26
best = np.full((H, W), 1e9)
region = np.full((H, W), "", dtype=object)
for name, pos in SEEDS.items():
    sx, sy = px(pos)
    dd = np.sqrt((wx - sx) ** 2 + (wy - sy) ** 2)
    closer = dd < best
    best = np.where(closer, dd, best)
    region = np.where(closer, name, region)
explored = ground & (best < REACH)
snow = ground & (v + (n2 - 0.5) * 0.30 + np.sin(u * 19) * 0.015 < 0.33)
explored &= ~snow
fog = ground & ~explored & ~snow
R = {k: explored & (region == k) for k in SEEDS}

img = np.zeros((H, W, 3), np.uint8)
near = [grow(land, k) for k in (1, 3, 7, 14)]
img[sea] = C("2d5fa8")
img[sea & near[3]] = C("3672bd")
img[sea & near[2]] = C("4589d0")
img[sea & near[1]] = C("68b6e6")
img[sea & near[0]] = C("a8e6f5")
dt = np.sqrt(((u - TEMPLE[0]) * W / H) ** 2 + (v - TEMPLE[1]) ** 2)
img[sea & (dt < 0.075)] = C("2a4f96")
img[sea & (dt < 0.05)] = C("1f3d7c")

img[fog] = C("9fc184")
img[snow] = C("eef4ff")
img[snow & (n3 > 0.55)] = C("d8e4f6")
img[R["village"]] = C("a4dc78")
img[R["field"]] = C("8fd36a")
img[R["field"] & (n3 > 0.56)] = C("7fc65e")
img[R["hill"]] = C("b4e08a")
img[R["hill"] & (n3 > 0.55)] = C("c7e89c")
img[R["forest"]] = C("4a9a4f")
img[R["forest"] & (n3 > 0.55)] = C("3f8a45")
img[R["desert"]] = C("f2c27a")
img[R["desert"] & (n3 > 0.58)] = C("eab56a")
img[R["desert2"]] = C("d99a5e")
img[R["desert2"] & (n3 > 0.55)] = C("c98850")
img[R["desert3"]] = C("9a7488")
img[R["desert3"] & (n3 > 0.55)] = C("886478")
img[R["swamp"]] = C("5f8a5a")
img[R["swamp"] & (n3 > 0.55)] = C("8a6aa0")
img[R["waterfall"]] = C("7fcf6a")
img[R["beach"]] = C("f4e3a6")
img[R["beach"] & (n3 > 0.6)] = C("ead39a")
img[R["ruinvillage"]] = C("7c9a5a")
img[R["ruinvillage"] & (n3 > 0.55)] = C("6e8a50")
img[R["crystalcave"]] = C("7a7f9e")
img[R["crystalcave"] & (n3 > 0.55)] = C("6a6f8e")
img[R["lava"]] = C("6e3a32")
img[R["lava"] & (n3 > 0.6)] = C("ff8a2a")
img[R["hell"]] = C("4a2238")
img[R["hell"] & (n3 > 0.62)] = C("c02a3a")
beach = ground & grow(sea, 1) & ~snow
img[beach & ~fog] = C("f4e3a6")
img[inland_water] = C("5fb4ea")
img[inland_water & ~grow(~inland_water, 1)] = C("4a9ee0")
img[land & grow(sea, 1)] = C("3b2d55")

rng = np.random.default_rng(11)


def put(x, y, col):
    x, y = int(x), int(y)
    if 0 <= x < W and 0 <= y < H:
        img[y, x] = C(col)


def sprite(x, y, rows, pal):
    """rows: 문자열 줄들, (x, y)는 아래 가운데"""
    h, w = len(rows), len(rows[0])
    for j, row in enumerate(rows):
        for i, ch in enumerate(row):
            if ch in pal:
                put(x + i - w // 2, y + j - h + 1, pal[ch])


def spots(mask, count, tries=4000, gap=0, avoid=None):
    out = []
    for _ in range(tries):
        if len(out) >= count:
            break
        x, y = int(rng.integers(0, W)), int(rng.integers(0, H))
        if not mask[y, x] or (avoid is not None and avoid[y, x]):
            continue
        if gap and any(abs(x - a) + abs(y - b) < gap for a, b in out):
            continue
        out.append((x, y))
    return sorted(out, key=lambda q: q[1])


# ── 흙길: 지역을 차례로 잇고, 마을에서 설산·서쪽 바다로 ──
road = np.zeros((H, W), bool)


def lay_road(a, b, seed):
    ax, ay = px(a)
    bx, by = px(b)
    steps = int(np.hypot(bx - ax, by - ay) * 2)
    r = np.random.default_rng(seed)
    off = r.uniform(-4, 4)
    for i in range(steps + 1):
        f = i / steps
        x = ax + (bx - ax) * f - (by - ay) / max(1, np.hypot(bx - ax, by - ay)) * np.sin(f * np.pi) * off
        y = ay + (by - ay) * f + (bx - ax) / max(1, np.hypot(bx - ax, by - ay)) * np.sin(f * np.pi) * off
        if 0 <= int(x) < W and 0 <= int(y) < H:
            road[int(y), int(x)] = True


for i in range(len(ROUTE) - 1):
    lay_road(SEEDS[ROUTE[i]], SEEDS[ROUTE[i + 1]], i)
lay_road(SEEDS["village"], (0.38, 0.30), 20)
lay_road(SEEDS["village"], (0.20, 0.50), 21)
for i, (a, b) in enumerate([("village", "swamp"), ("swamp", "waterfall"), ("swamp", "beach"), ("swamp", "ruinvillage"), ("ruinvillage", "crystalcave")]):
    lay_road(SEEDS[a], SEEDS[b], 30 + i)
road &= land
bridge = road & inland_water
road_g = road & ground
edge = grow(road_g, 1) & ground & ~road_g & ~beach
img[edge & ~fog & ~snow] = (img[edge & ~fog & ~snow] * 0.86).astype(np.uint8)
img[road_g] = C("dcc08e")
img[road_g & (R["desert3"])] = C("b89aa8")
img[grow(bridge, 1) & inland_water] = C("8a5a3a")
img[bridge] = C("c08a5a")

# ── 바다 물결 ──
for x, y in spots(sea & ~near[1], 80):
    for k in range(4):
        put(x + k, y - (1 if k in (1, 2) else 0), "8fcff0")

# ── 설산 봉우리 ──
water_near = grow(sea | inland_water, 3)
for x, y in spots(snow & ~water_near & (v > 0.06), 34, gap=5):
    s = int(rng.integers(5, 9))
    for k in range(s):
        for j in range(-k, k + 1):
            put(x + j, y - s + k + 1, "f8fbff" if k < s // 2 else ("9a8fae" if j < 0 else "7c7194"))
        put(x - k - 1, y - s + k + 1, "3b2d55")
        put(x + k + 1, y - s + k + 1, "3b2d55")
    put(x, y - s, "3b2d55")

clear = water_near | grow(road, 1)

# ── 마을: 밀밭, 집, 우물 ──
vx, vy = px(SEEDS["village"])
for x, y in spots(R["village"] & ~clear, 5, gap=7):
    for j in range(3):
        for i in range(5):
            put(x + i - 2, y - j * 2, "e8c84a" if (i + j) % 2 == 0 else "d4b03a")
HOUSE = ["..###..", ".#rrr#.", "#rrrrr#", "#wwdww#", "#wwdww#", "#######"]
for k, (ox, oy) in enumerate([(-7, -4), (2, -6), (-3, 4), (7, 3), (-10, 3), (5, -1)]):
    roof = ["c94a3a", "4a6fc9", "c98a3a"][k % 3]
    sprite(vx + ox, vy + oy, HOUSE, {"#": "3b2d55", "r": roof, "w": "f4ead2", "d": "7a4a2a"})
sprite(vx - 1, vy + 0, [".###.", "#bbb#", "#ggg#", ".###."], {"#": "3b2d55", "b": "5fb4ea", "g": "9a8fae"})

# ── 초원: 풀숲·덤불·작은 꽃 ──
for x, y in spots(R["field"] & ~clear, 40, gap=3):
    sprite(x, y, ["#.#.#", ".###."], {"#": "5aa845"})
for x, y in spots(R["field"] & ~clear, 10, gap=5):
    sprite(x, y, [".##.", "#oo#", "####"], {"#": "2f6a35", "o": "6fbf55"})
for x, y in spots(R["field"], 30):
    put(x, y, ["ffffff", "ffd84d"][int(rng.integers(0, 2))])

# ── 꽃바람 언덕: 둥근 언덕 음영, 벚꽃나무, 꽃밭 ──
for x, y in spots(R["hill"] & ~clear, 7, gap=8):
    for k in range(-5, 6):
        put(x + k, y - int(np.sqrt(max(0, 25 - k * k)) * 0.6), "d9f0b4")
        put(x + k, y, "8fc46a")
BLOSSOM = [".###.", "#ppp#", "#pPp#", "#ppp#", ".#|#.", "..|.."]
for x, y in spots(R["hill"] & ~clear, 14, gap=5):
    pink = ["ff9ec8", "ffb8d8", "f7c86a"][int(rng.integers(0, 3))]
    sprite(x, y, BLOSSOM, {"#": "8a3f6a", "p": pink, "P": "ffffff", "|": "6b4a34"})
for x, y in spots(R["hill"], 160):
    put(x, y, ["ff9ec8", "ffffff", "ffd84d", "c77dff"][int(rng.integers(0, 4))])

# ── 어스름 숲: 빽빽한 나무 ──
TREE = ["..#..", ".#o#.", "#ooo#", "#o*o#", ".###.", "..|.."]
for x, y in spots(R["forest"] & ~grow(road, 1), 70, gap=3):
    sprite(x, y, TREE, {"#": "1f4a2a", "o": "2f7a3a", "*": "4f9e4a", "|": "4a3424"})

# ── 타오르는 사막: 모래 언덕, 야자수, 오아시스 ──
sx, sy = px(SEEDS["desert"])
oasis = (np.sqrt(((xx - sx - 6) / 4.0) ** 2 + ((yy - sy + 5) / 2.5) ** 2) < 1.0) & R["desert"]
img[oasis] = C("5fb4ea")
img[grow(oasis, 1) & ~oasis & R["desert"]] = C("7fc65e")
for x, y in spots(R["desert"] & ~clear & ~grow(oasis, 2), 10, gap=6):
    for k in range(-3, 4):
        put(x + k, y + abs(k) // 2, "c98a4a")
PALM = ["#.#.#", ".###.", "..|..", "..|..", "..|.."]
for x, y in spots(grow(oasis, 3) & R["desert"] & ~oasis, 4, gap=4) + spots(R["desert"] & ~clear, 4, gap=8):
    sprite(x, y, PALM, {"#": "3f8a45", "|": "8a5a3a"})

# ── 모래바람 협곡: 절벽 띠, 바위 ──
for x, y in spots(R["desert2"] & ~clear, 9, gap=7):
    ln = int(rng.integers(6, 11))
    for k in range(ln):
        put(x + k - ln // 2, y, "7a4a32")
        put(x + k - ln // 2, y - 1, "e6b07a")
        put(x + k - ln // 2, y + 1, "a8683e")
for x, y in spots(R["desert2"] & ~clear, 10, gap=4):
    sprite(x, y, [".##.", "#rr#", "####"], {"#": "4a3a3a", "r": "a89a8a"})

# ── 저주받은 폐허: 부서진 기둥, 해골, 보랏빛 안개 ──
for x, y in spots(R["desert3"] & ~clear, 9, gap=5):
    hgt = int(rng.integers(2, 6))
    for j in range(hgt):
        put(x, y - j, "d8d0e0")
        put(x + 1, y - j, "a89ab8")
    put(x - 1, y, "6a5a78")
    put(x + 2, y, "6a5a78")
for x, y in spots(R["desert3"] & ~clear, 8, gap=4):
    sprite(x, y, ["###", "#.#", ".#."], {"#": "f4f0e8"})
mist = R["desert3"] & (n3 > 0.6)
img[mist] = (img[mist] * 0.6 + np.array([150, 110, 180]) * 0.4).astype(np.uint8)

# ── 해저 신전: 물속 기둥 고리 ──
cx, cy = px(TEMPLE)
for a in range(8):
    ang = a / 8 * 2 * np.pi
    qx, qy = int(cx + np.cos(ang) * 9), int(cy + np.sin(ang) * 7)
    for j in range(3):
        put(qx, qy - j, "c9d8f0")
    put(qx, qy - 3, "eef4ff")
for j in range(-2, 3):
    put(cx + j, cy + 1, "8aa0d0")

# ── 1장 남쪽: 늪 웅덩이, 폭포 절벽, 해변 야자수, 폐허 집, 동굴 바위 / 4장 용암 강·지옥 해골 ──
for x, y in spots(R["swamp"] & ~clear, 8, gap=6):
    sprite(x, y, [".###.", "#ppp#", ".###."], {"#": "3b2d55", "p": "9a6ab8"})
for x, y in spots(R["swamp"] & ~clear, 10, gap=4):
    sprite(x, y, ["#.#", ".#.", ".#."], {"#": "5a4030"})
wx0, wy0 = px(SEEDS["waterfall"])
for k in range(-6, 7):
    put(wx0 + k, wy0 - 7, "6f7390")
    put(wx0 + k, wy0 - 6, "5d6180")
for j in range(6):
    put(wx0, wy0 - 6 + j, "bfe6ff")
    put(wx0 + 1, wy0 - 6 + j, "8fcff0")
for x, y in spots(R["waterfall"] & ~clear, 10, gap=4):
    sprite(x, y, TREE, {"#": "1f4a2a", "o": "2f7a3a", "*": "4f9e4a", "|": "4a3424"})
for x, y in spots(R["beach"] & ~clear, 8, gap=5):
    sprite(x, y, PALM, {"#": "3f8a45", "|": "8a5a34"})
for x, y in spots(R["ruinvillage"] & ~clear, 6, gap=6):
    sprite(x, y, [".###.", "#r.r#", "#w.w#", "#####"], {"#": "3b2d55", "r": "7a6a5a", "w": "b8a890"})
for x, y in spots(R["crystalcave"] & ~clear, 10, gap=4):
    sprite(x, y, [".##.", "#rr#", "####"], {"#": "3b3550", "r": "9a9ab8"})
for x, y in spots(R["crystalcave"] & ~clear, 6, gap=4):
    sprite(x, y, [".c.", "ccc"], {"c": "7ff5ee"})
for x, y in spots(R["lava"] & ~clear, 8, gap=5):
    for k in range(-4, 5):
        put(x + k, y + int(np.sin(k) * 1.5), "ffb02a")
for x, y in spots(R["lava"] & ~clear, 6, gap=6):
    sprite(x, y, ["..#..", ".#r#.", "#rrr#"], {"#": "2a1a1a", "r": "5a3a32"})
for x, y in spots(R["hell"] & ~clear, 8, gap=4):
    sprite(x, y, ["###", "#.#", ".#."], {"#": "e8e0d8"})
for x, y in spots(R["hell"] & ~clear, 6, gap=6):
    for k in range(5):
        put(x + k, y + (k % 2), "ff3a4a")

# ── 아직 못 가는 땅: 구름으로 덮기 ──
cloud = np.zeros((H, W), bool)
shade = np.zeros((H, W), bool)
for x, y in spots(fog & ~grow(explored, 5) & ~grow(inland_water | road, 3), 40, tries=20000, gap=12):
    r = rng.uniform(4, 7)
    blob = ((xx - x) / 1.25) ** 2 + (yy - y) ** 2 < r * r
    shade |= ((xx - x) / 1.25) ** 2 + (yy - y - 2) ** 2 < r * r
    cloud |= blob
cloud &= ~explored | ~grow(explored, 0)
shade &= ~cloud
edge_mask = (cloud | shade) & ~grow(explored & ~fog, 0)
img[shade & edge_mask] = C("b9c6d8")
img[cloud & edge_mask] = C("eef2f8")
inner = cloud & ~grow(~cloud, 2) & (n3 > 0.55)
img[inner & edge_mask] = C("ffffff")
outline = grow(cloud | shade, 1) & ~(cloud | shade) & fog
img[outline] = C("8a9ab0")

big = Image.fromarray(img).resize((W * 2, H * 2), Image.NEAREST)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
big.save(OUT)
print("saved", big.size)
