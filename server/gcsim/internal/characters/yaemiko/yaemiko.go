package yaemiko

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/action"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
)

const (
	yaeTotemCount  = "totems"
	yaeTotemStatus = "yae_oldest_totem_expiry"
)

func init() {
	core.RegisterCharFunc(keys.YaeMiko, NewChar)
}

type char struct {
	*tmpl.Character
	kitsuneDetectionRadius float64
	kitsunes               []*kitsune
	c4buff                 []float64
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 90
	c.NormalHitNum = normalHitNum
	c.BurstCon = 5
	c.SkillCon = 3

	c.SetNumCharges(action.ActionSkill, 3)

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a4()
	if c.Base.Cons >= 2 {
		c.kitsuneDetectionRadius = 20
	} else {
		c.kitsuneDetectionRadius = 12.5
	}
	if c.Base.Cons >= 4 {
		c.c4buff = make([]float64, attributes.EndStatType)
		c.c4buff[attributes.ElectroP] = .20
	}
	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	if k == info.AnimationXingqiuN0StartDelay {
		return 7
	}
	return c.Character.AnimationStartDelay(k)
}
