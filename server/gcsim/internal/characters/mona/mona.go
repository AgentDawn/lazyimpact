package mona

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

const (
	bubbleKey = "mona-bubble"
	omenKey   = "omen-debuff"
)

func init() {
	core.RegisterCharFunc(keys.Mona, NewChar)
}

type char struct {
	*tmpl.Character
	a4Stats  []float64
	c6Src    int
	c6Stacks int
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 60
	c.NormalHitNum = normalHitNum
	c.BurstCon = 3
	c.SkillCon = 5

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.burstHook()
	c.burstDamageBonus()
	c.a4()
	if c.Base.Cons >= 1 {
		c.c1()
	}
	if c.Base.Cons >= 2 {
		c.c2()
	}
	if c.Base.Cons >= 4 {
		c.c4()
	}
	return nil
}
