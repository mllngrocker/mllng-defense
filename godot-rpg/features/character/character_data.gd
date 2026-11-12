class_name CharacterData
extends Resource
## 캐릭터 한 명의 정보: 이름·등급·속성·그림·능력치·공격 방식·별 효과.
## data/characters/*.tres 로 하나씩 만든다.

enum Element { FIRE, WATER, WIND, EARTH, LIGHT, DARK }
enum AttackKind { COMBO, MAGIC, HEAVY, BOW, DAGGER }

const ELEMENT_NAMES: Array[String] = ["불", "물", "바람", "땅", "빛", "어둠"]
const ELEMENT_COLORS: Array[Color] = [
	Color("ff7043"), Color("4fc3f7"), Color("81c784"), Color("c8a165"), Color("fff176"), Color("b388ff"),
]
const ATTACK_NAMES: Array[String] = ["근거리 연타", "원거리 마법", "근거리 묵직", "원거리 활", "근거리 단검"]

@export var id: StringName
@export var display_name := ""
@export var title := ""
@export_range(3, 5) var rarity := 3
@export var element: Element = Element.FIRE
@export var attack_kind: AttackKind = AttackKind.COMBO

@export_group("그림")
## 쯔꾸르 규격 걷기 그림(3열×4줄, 한 칸 96px)
@export var walk_sheet: Texture2D
@export var face: Texture2D
## 큰 일러스트(표정별)
@export var portraits: Array[Texture2D] = []
## 캐릭터 카드에 쓸 일러스트 영역(상반신, 첫 번째 일러스트 기준)
@export var card_crop := Rect2(75, 0, 260, 325)
## 공격 궤적 색
@export var trail_color := Color.WHITE

@export_group("능력치")
@export var base_atk := 10
@export var atk_growth := 2.0
@export var base_hp := 100
@export var hp_growth := 12.0
@export var move_speed := 72.0

@export_group("스킬")
## 스킬 버튼으로 쓰는 고유 기술(동작은 features/player/skill_caster.gd에서 id로 고른다)
@export var skill_name := ""
@export var skill_desc := ""
@export var skill_cooldown := 8.0
## 5성만: 그 캐릭터만 가진 고유 능력(이름·설명). 동작은 Player에서 id로 고른다
@export var unique_name := ""
@export var unique_desc := ""

@export_group("별 효과")
## 별 1~6개째에 열리는 효과 설명
@export var star_passives: Array[String] = []


func atk_at(level: int) -> int:
	return base_atk + int(atk_growth * (level - 1))


func hp_at(level: int) -> int:
	return base_hp + int(hp_growth * (level - 1))
