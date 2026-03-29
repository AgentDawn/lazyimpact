package shenhe

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
	core.RegisterCharFunc(keys.Shenhe, NewChar)
}

type char struct {
	*tmpl.Character
	skillBuff []float64
	burstBuff []float64
	c2buff    []float64
	c4count   int
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 80
	c.NormalHitNum = normalHitNum
	c.BurstCon = 5
	c.SkillCon = 3

	c.c4count = 0

	if c.Base.Cons >= 1 {
		c.SetNumCharges(action.ActionSkill, 2)
	}

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.skillBuff = make([]float64, attributes.EndStatType)
	c.skillBuff[attributes.DmgP] = 0.15
	c.quillDamageMod()

	c.burstBuff = make([]float64, attributes.EndStatType)
	c.burstBuff[attributes.CryoP] = 0.15

	if c.Base.Cons >= 2 {
		c.c2buff = make([]float64, attributes.EndStatType)
		c.c2buff[attributes.CD] = 0.15
	}

	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	if k == info.AnimationXingqiuN0StartDelay {
		return 12
	}
	return c.Character.AnimationStartDelay(k)
}
