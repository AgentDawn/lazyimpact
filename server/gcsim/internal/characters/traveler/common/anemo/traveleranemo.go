package anemo

import (
	"lazyimpact/gcsim/internal/characters/traveler/common"
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
)

type Traveler struct {
	*tmpl.Character
	qAbsorb              attributes.Element
	qICDTag              attacks.ICDTag
	qAbsorbCheckLocation info.AttackPattern
	eAbsorb              attributes.Element
	eICDTag              attacks.ICDTag
	eAbsorbCheckLocation info.AttackPattern
	gender               int
}

func NewTraveler(s *core.Core, w *character.CharWrapper, p info.CharacterProfile, gender int) (*Traveler, error) {
	c := Traveler{
		gender: gender,
	}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.Base.Element = attributes.Anemo
	c.EnergyMax = 60
	c.BurstCon = 3
	c.SkillCon = 5
	c.NormalHitNum = normalHitNum

	common.TravelerStoryBuffs(w, p)
	return &c, nil
}

func (c *Traveler) Init() error {
	c.a4()
	if c.Base.Cons >= 2 {
		c.c2()
	}
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
