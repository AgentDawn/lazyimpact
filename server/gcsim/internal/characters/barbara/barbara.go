package barbara

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Barbara, NewChar)
}

type char struct {
	*tmpl.Character
	c6icd         int
	skillInitF    int
	a4extendCount int
	c2buff        []float64
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 80
	c.BurstCon = 3
	c.SkillCon = 5
	c.NormalHitNum = normalHitNum

	c.c2buff = make([]float64, attributes.EndStatType)
	c.c2buff[attributes.HydroP] = 0.15

	w.Character = &c
	return nil
}

func (c *char) Init() error {
	c.a4()

	if c.Base.Cons >= 1 {
		c.c1(1)
	}
	if c.Base.Cons >= 6 {
		c.c6()
	}
	return nil
}
