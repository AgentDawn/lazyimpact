package eula

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Eula, NewChar)
}

type char struct {
	*tmpl.Character
	burstCounter    int
	grimheartStacks int
	c1buff          []float64
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 80
	c.NormalHitNum = normalHitNum
	c.BurstCon = 3
	c.SkillCon = 5

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	if c.Base.Cons >= 1 {
		c.c1buff = make([]float64, attributes.EndStatType)
		c.c1buff[attributes.PhyP] = 0.3
	}
	c.onExitField()
	if c.Base.Cons >= 4 {
		c.c4()
	}
	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	if k == info.AnimationXingqiuN0StartDelay {
		return 22
	}
	return c.Character.AnimationStartDelay(k)
}
