package lynette

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Lynette, NewChar)
}

type char struct {
	*tmpl.Character
	a1Buff         []float64
	skillAI        info.AttackInfo
	skillAlignedAI info.AttackInfo
	shadowsignSrc  int
	vividCount     int
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 70
	c.NormalHitNum = normalHitNum
	c.BurstCon = 3
	c.SkillCon = 5
	c.HasArkhe = true

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.skillAI = info.AttackInfo{
		ActorIndex:         c.Index(),
		Abil:               "Enigmatic Feint",
		AttackTag:          attacks.AttackTagElementalArt,
		ICDTag:             attacks.ICDTagNone,
		ICDGroup:           attacks.ICDGroupDefault,
		StrikeType:         attacks.StrikeTypeSpear,
		Element:            attributes.Anemo,
		Durability:         25,
		Mult:               skill[c.TalentLvlSkill()],
		HitlagFactor:       0.01,
		CanBeDefenseHalted: true,
	}
	c.skillAlignedAI = info.AttackInfo{
		ActorIndex:         c.Index(),
		Abil:               "Surging Blade (" + c.Base.Key.Pretty() + ")",
		AttackTag:          attacks.AttackTagElementalArt,
		ICDTag:             attacks.ICDTagNone,
		ICDGroup:           attacks.ICDGroupDefault,
		StrikeType:         attacks.StrikeTypeSpear,
		Element:            attributes.Anemo,
		Durability:         0,
		Mult:               skillAligned[c.TalentLvlSkill()],
		HitlagFactor:       0.01,
		CanBeDefenseHalted: true,
	}

	c.a1Setup()

	c.vividCount = 1
	c.c2()
	c.c4()

	return nil
}
