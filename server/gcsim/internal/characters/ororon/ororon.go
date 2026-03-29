package ororon

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/internal/template/nightsoul"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/core/stacks"
)

func init() {
	core.RegisterCharFunc(keys.Ororon, NewChar)
}

type char struct {
	*tmpl.Character
	nightsoulState     *nightsoul.State
	particlesGenerated bool
	burstSrc           int
	burstArea          info.AttackPattern
	c2Bonus            []float64
	c6stacks           *stacks.MultipleRefreshNoRemove
	c6bonus            []float64
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 60
	c.NormalHitNum = normalHitNum
	c.BurstCon = 3
	c.SkillCon = 5
	c.nightsoulState = nightsoul.New(s, w)
	c.nightsoulState.MaxPoints = 80

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a1Init()
	c.a4Init()
	c.c1Init()
	c.c2Init()
	c.c6Init()
	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	if k == info.AnimationXingqiuN0StartDelay {
		return 14
	}
	return c.Character.AnimationStartDelay(k)
}
