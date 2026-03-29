package ineffa

import (
	tmpl "lazyimpact/gcsim/internal/template/character"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/action"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player"
	"lazyimpact/gcsim/pkg/core/player/character"
)

func init() {
	core.RegisterCharFunc(keys.Ineffa, NewChar)
}

type char struct {
	*tmpl.Character
	birgittaSrc int
	skillShield *shd
}

func NewChar(s *core.Core, w *character.CharWrapper, _ info.CharacterProfile) error {
	c := char{}
	c.Character = tmpl.NewWithWrapper(s, w)

	c.EnergyMax = 60
	c.NormalHitNum = normalHitNum
	c.SkillCon = 3
	c.BurstCon = 5
	c.Moonsign = 1

	w.Character = &c

	return nil
}

func (c *char) Init() error {
	c.a4Init()
	c.lunarchargeInit()

	c.c1Init()
	c.c4Init()
	c.c6Init()
	return nil
}

func (c *char) AnimationStartDelay(k info.AnimationDelayKey) int {
	if k == info.AnimationXingqiuN0StartDelay {
		return 12
	}
	return c.Character.AnimationStartDelay(k)
}

func (c *char) NextQueueItemIsValid(_ keys.Char, a action.Action, p map[string]int) error {
	if a == action.ActionCharge {
		switch c.Weapon.Class {
		case info.WeaponClassSword, info.WeaponClassSpear:
			if c.NormalCounter == 0 {
				return player.ErrInvalidChargeAction
			}
		}
	}
	return nil
}
