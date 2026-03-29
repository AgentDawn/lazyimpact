package sucrose

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/action"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Sucrose, NewChar)
}

type char struct {
	*tmpl.Character
	qAbsorb             attributes.Element
	absorbCheckLocation info.AttackPattern
	a1Buff              []float64
	a4Buff              []float64
	c4Count             int
	c6buff              []float64
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 80
	c.NormalHitNum = normalHitNum
	c.SkillCon = 3
	c.BurstCon = 5

	if c.Base.Cons >= 1 {
		c.SetNumCharges(action.ActionSkill, 2)
	}

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a1()
	if c.Base.Cons >= 6 {
		c.c6buff = make([]float64, attributes.EndStatType)
	}
	return nil
}
