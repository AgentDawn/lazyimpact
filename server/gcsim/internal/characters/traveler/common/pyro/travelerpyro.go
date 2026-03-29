package pyro

import (
	"lazyimpact/gcsim/internal/characters/traveler/common"
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/internal/template/nightsoul"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
)

type Traveler struct {
	*tmpl.Character
	nightsoulState        *nightsoul.State
	nightsoulSrc          int
	gender                int
	c2ActivationsPerSkill int
}

func NewTraveler(s *core.Core, w *character.CharWrapper, p info.CharacterProfile, gender int) (*Traveler, error) {
	c := Traveler{
		gender: gender,
	}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.Base.Element = attributes.Pyro
	c.EnergyMax = 70
	c.BurstCon = 5
	c.SkillCon = 3
	c.NormalHitNum = 5

	common.TravelerStoryBuffs(w, p)

	c.nightsoulState = nightsoul.New(s, w)
	c.nightsoulState.MaxPoints = 80
	c.c2ActivationsPerSkill = 0

	return &c, nil
}

func (c *Traveler) Init() error {
	c.scorchingThresholdOnDamage()
	c.a4Init()
	c.c1Init()
	c.c2Init()
	c.c6Init()
	return nil
}

func (c *Traveler) AnimationStartDelay(k info.AnimationDelayKey) int {
	switch k {
	case info.AnimationXingqiuN0StartDelay:
		if c.gender == 0 {
			return 8
		}
		return 7
	default:
		return c.Character.AnimationStartDelay(k)
	}
}

func (c *Traveler) Condition(fields []string) (any, error) {
	switch fields[0] {
	case "nightsoul":
		return c.nightsoulState.Condition(fields)
	default:
		return c.Character.Condition(fields)
	}
}
