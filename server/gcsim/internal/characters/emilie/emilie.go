package emilie

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Emilie, NewChar)
}

type char struct {
	*tmpl.Character

	caseTravel   int
	lumidouceSrc int
	lumidoucePos info.Point

	prevLumidouceLvl  int
	burstMarkDuration int

	c6Scents int
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 50
	c.NormalHitNum = normalHitNum
	c.BurstCon = 5
	c.SkillCon = 3
	c.HasArkhe = true

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a4()
	c.c1()

	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	switch k {
	case info.AnimationXingqiuN0StartDelay:
		return 15
	case info.AnimationYelanN0StartDelay:
		return 6
	default:
		return c.Character.AnimationStartDelay(k)
	}
}
