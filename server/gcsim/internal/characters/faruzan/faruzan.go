package faruzan

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Faruzan, NewChar)
}

type char struct {
	*tmpl.Character
	hurricaneCount int
	burstSrc       int
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 80
	c.NormalHitNum = normalHitNum
	c.SkillCon = 3
	c.BurstCon = 5

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a4()
	if c.Base.Cons >= 6 {
		c.c6Collapse()
	}
	return nil
}

func (c *char) Condition(fields []string) (any, error) {
	switch fields[0] {
	case "hurricane-count":
		if !c.StatusIsActive(skillKey) {
			return 0, nil
		}
		return c.hurricaneCount, nil
	default:
		return c.Character.Condition(fields)
	}
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	if k == info.AnimationXingqiuN0StartDelay {
		return 9
	}
	return c.Character.AnimationStartDelay(k)
}
