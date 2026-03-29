package dahlia

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Dahlia, NewChar)
}

type char struct {
	*tmpl.Character

	shield               *shd
	benisonGenStackLimit int
	currentBenisonStacks int
	normalAttackCount    int

	attackSpeedBuff []float64
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 60
	c.NormalHitNum = normalHitNum
	c.SkillCon = 5
	c.BurstCon = 3

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.setupBurst()
	c.a1()
	c.a4()
	c.c6()

	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	switch k {
	case info.AnimationXingqiuN0StartDelay:
		return 10
	case info.AnimationYelanN0StartDelay:
		return 0
	default:
		return c.Character.AnimationStartDelay(k)
	}
}
