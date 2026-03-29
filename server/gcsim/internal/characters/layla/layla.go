package layla

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Layla, NewChar)
}

type char struct {
	*tmpl.Character
	a1Stack          int
	particleCBSwitch bool
	starTickSrc      int
	shootStarSrc     int
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 40
	c.NormalHitNum = normalHitNum
	c.BurstCon = 5
	c.SkillCon = 3

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.starTickSrc = -1
	c.shootStarSrc = -1
	c.starsSkill()

	c.a1()

	if c.Base.Cons >= 4 {
		c.c4()
	}
	if c.Base.Cons >= 6 {
		c.c6()
	}

	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	if k == info.AnimationXingqiuN0StartDelay {
		return 12
	}
	return c.Character.AnimationStartDelay(k)
}
