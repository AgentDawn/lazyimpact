package sayu

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/hacks"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Sayu, NewChar)
	hacks.RegisterNOSpecialChar(keys.Sayu)
}

type char struct {
	*tmpl.Character
	eDuration           int
	eAbsorb             attributes.Element
	eAbsorbTag          attacks.ICDTag
	absorbCheckLocation info.AttackPattern
	qTickRadius         float64
	c2Bonus             float64
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 80
	c.NormalHitNum = normalHitNum
	c.BurstCon = 3
	c.SkillCon = 5

	c.eDuration = -1
	c.eAbsorb = attributes.NoElement
	c.qTickRadius = 1
	c.c2Bonus = .0

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a1()
	c.a4()
	c.rollAbsorb()
	if c.Base.Cons >= 2 {
		c.c2()
	}
	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	if k == info.AnimationXingqiuN0StartDelay {
		return 24
	}
	return c.Character.AnimationStartDelay(k)
}
