package dori

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Dori, NewChar)
}

type char struct {
	*tmpl.Character
	afterCount int
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 80
	c.NormalHitNum = normalHitNum
	c.BurstCon = 3
	c.SkillCon = 5
	c.afterCount = 2

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a1()
	if c.Base.Cons >= 1 {
		c.c1()
	}
	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	if k == info.AnimationXingqiuN0StartDelay {
		return 29
	}
	return c.Character.AnimationStartDelay(k)
}
