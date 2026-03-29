package xianyun

import (
	"lazyimpact/gcsim/pkg/core/action"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/glog"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

const (
	c2Key = "xianyun-c2"
	c4Icd = "xianyun-c4-icd"
	c6Key = "xianyun-c6"
)

const (
	c2Dur    = 15 * 60
	c4IcdDur = 5 * 60
	c6Dur    = 16 * 60
)

var (
	c4Ratio   = []float64{0, 0.5, 0.8, 1.5}
	c6Buff    = []float64{0, 0.15, 0.35, 0.7}
	c2BuffMod []float64
)

func (c *char) c1() {
	if c.Base.Cons < 1 {
		return
	}
	c.SetNumCharges(action.ActionSkill, 2)
}

func (c *char) c2() {
	if c.Base.Cons < 2 {
		return
	}

	c2BuffMod = make([]float64, attributes.EndStatType)
	c2BuffMod[attributes.ATKP] = 0.20

	c.a4Max = 18000
	c.a4Ratio = 4
}

func (c *char) c2buff() {
	if c.Base.Cons < 2 {
		return
	}

	c.AddStatMod(character.StatMod{
		Base:         modifier.NewBaseWithHitlag(c2Key, c2Dur),
		AffectedStat: attributes.ATKP,
		Amount: func() []float64 {
			return c2BuffMod
		},
	})
}

func (c *char) c4cb() func(a info.AttackCB) {
	if c.Base.Cons < 4 {
		return nil
	}

	return func(a info.AttackCB) {
		if a.Target.Type() != info.TargettableEnemy {
			return
		}

		if c.StatusIsActive(c4Icd) {
			return
		}

		c.Core.Player.Heal(info.HealInfo{
			Caller:  c.Index(),
			Target:  -1,
			Message: "Mystery Millet Gourmet (C4)",
			Src:     c4Ratio[c.skillCounter] * c.TotalAtk(),
			Bonus:   c.Stat(attributes.Heal),
		})

		c.AddStatus(c4Icd, c4IcdDur, true)
	}
}

func (c *char) c6() {
	if c.Base.Cons < 6 {
		return
	}
	c.AddStatus(c6Key, c6Dur, true)
	c.SetTag(c6Key, 8)
}

func (c *char) c6mod(snap *info.Snapshot) {
	if c.Base.Cons < 6 {
		return
	}
	old := snap.Stats[attributes.CD]
	snap.Stats[attributes.CD] += c6Buff[c.skillCounter]
	c.Core.Log.NewEvent("c6 adding crit DMG", glog.LogCharacterEvent, c.Index()).
		Write("old", old).
		Write("new", snap.Stats[attributes.CD])
}
