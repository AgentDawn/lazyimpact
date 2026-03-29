package charlotte

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Charlotte, NewChar)
}

type char struct {
	*tmpl.Character
	markCount int
	c2Hits    int
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 80
	c.NormalHitNum = normalHitNum
	c.SkillCon = 5
	c.BurstCon = 3
	c.HasArkhe = true

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a1()
	c.a4()

	if c.Base.Cons >= 1 {
		c.c1()
	}

	if c.Base.Cons >= 4 {
		c.c4()
	}

	if c.Base.Cons >= 6 {
		c.c6()
	}

	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	switch k {
	case info.AnimationXingqiuN0StartDelay:
		return 6
	case info.AnimationYelanN0StartDelay:
		return 4
	default:
		return c.Character.AnimationStartDelay(k)
	}
}
