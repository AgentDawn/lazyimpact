package baizhu

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Baizhu, NewChar)
}

type char struct {
	*tmpl.Character
	skillAtk *info.AttackEvent
	c6done   bool
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)
	c.BurstCon = 3
	c.SkillCon = 5
	c.EnergyMax = 80
	c.NormalHitNum = normalHitNum
	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a1()
	if c.Base.Cons >= 1 {
		c.c1()
	}

	if c.Base.Cons >= 2 {
		c.c2()
	}

	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	switch k {
	case info.AnimationXingqiuN0StartDelay:
		return 8
	case info.AnimationYelanN0StartDelay:
		return 5
	default:
		return c.Character.AnimationStartDelay(k)
	}
}
