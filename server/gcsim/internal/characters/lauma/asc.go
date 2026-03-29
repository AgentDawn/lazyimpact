package lauma

import (
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/glog"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/enemy"
	"lazyimpact/gcsim/pkg/modifier"
	"lazyimpact/gcsim/pkg/reactable"
)

const (
	lunarbloomBonusKey = "lauma-lunarbloom-bonus"
	a1Key              = "light-for-the-frosty-night"
)

func (c *char) a1Init() {
	if c.Base.Ascension < 1 {
		return
	}

	if c.ascendantGleam {
		c.a1Ascendant()
	} else {
		// we must have nascent because lauma contributes one moonsign herself
		c.a1Nascent()
	}
}

func (c *char) a1Nascent() {
	c.Core.Events.Subscribe(event.OnEnemyHit, func(args ...any) {
		if !c.StatusIsActive(a1Key) {
			return
		}

		_, ok := args[0].(*enemy.Enemy)
		if !ok {
			return
		}
		ae := args[1].(*info.AttackEvent)

		switch ae.Info.AttackTag {
		case attacks.AttackTagBloom:
		case attacks.AttackTagHyperbloom:
		case attacks.AttackTagBurgeon:
		default:
			return
		}

		// critrate stacks with nahida c2 while critdmg is overwritten
		ae.Snapshot.Stats[attributes.CR] += 0.15
		ae.Snapshot.Stats[attributes.CD] = 1

		c.Core.Log.NewEvent("lauma a1 buff", glog.LogCharacterEvent, ae.Info.ActorIndex).
			Write("final_crit", ae.Snapshot.Stats[attributes.CR])
	}, "lauma-a1-reaction-dmg-buff")
}

func (c *char) a1Ascendant() {
	c.Core.Events.Subscribe(event.OnEnemyHit, func(args ...any) {
		if !c.StatusIsActive(a1Key) {
			return
		}

		_, ok := args[0].(*enemy.Enemy)
		if !ok {
			return
		}
		ae := args[1].(*info.AttackEvent)

		switch ae.Info.AttackTag {
		case attacks.AttackTagDirectLunarBloom:
		default:
			return
		}

		ae.Snapshot.Stats[attributes.CR] += 0.1
		ae.Snapshot.Stats[attributes.CD] += 0.2
		if c.Core.Flags.LogDebug {
			c.Core.Log.NewEvent("lauma a1 buff", glog.LogCharacterEvent, ae.Info.ActorIndex).
				Write("final_critrate", ae.Snapshot.Stats[attributes.CR]).
				Write("final_critdmg", ae.Snapshot.Stats[attributes.CD])
		}
	}, "lauma-a1-reaction-dmg-buff")
}

func (c *char) a4Init() {
	if c.Base.Ascension < 4 {
		return
	}

	// increase skill dmg of self by EM * 0.4% up to 32%
	m := make([]float64, attributes.EndStatType)
	em := c.Stat(attributes.EM)
	m[attributes.DmgP] = min(0.004*em, 0.32)
	c.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("lauma-a4", -1),
		Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
			if atk.Info.AttackTag != attacks.AttackTagElementalArt && atk.Info.AttackTag != attacks.AttackTagElementalArtHold {
				return nil
			}
			return m
		},
	})
}

func (c *char) lunarbloomInit() {
	c.Core.Flags.Custom[reactable.LunarBloomEnableKey] = 1

	c.Core.Events.Subscribe(event.OnEnemyHit, func(args ...any) {
		atk := args[1].(*info.AttackEvent)

		switch atk.Info.AttackTag {
		case attacks.AttackTagDirectLunarBloom:
		default:
			return
		}

		em := c.Stat(attributes.EM)
		bonus := min(em*0.000175, 0.14)

		if c.Core.Flags.LogDebug {
			c.Core.Log.NewEvent("lauma adding lunarbloom base damage", glog.LogCharacterEvent, c.Index()).Write("bonus", bonus)
		}

		atk.Info.BaseDmgBonus += bonus
	}, lunarbloomBonusKey)
}

func (c *char) a4SpiritEnvoyCooldownReduction() float64 {
	if c.Base.Ascension < 4 {
		return 1.0
	}

	em := c.Stat(attributes.EM)
	return 1.0 - min(0.2, em*0.0002)
}
