package kaveh

import (
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/combat"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/enemy"
	"lazyimpact/gcsim/pkg/modifier"
)

const (
	c2Key    = "kaveh-c2"
	c6ICDKey = "kaveh-c6-icd"
)

func (c *char) c1() {
	m := make([]float64, attributes.EndStatType)
	m[attributes.Heal] = 0.25
	c.AddStatMod(character.StatMod{
		Base:         modifier.NewBaseWithHitlag("kaveh-c1", 180),
		AffectedStat: attributes.NoStat,
		Amount: func() []float64 {
			return m
		},
	})
}

func (c *char) c2() {
	m := make([]float64, attributes.EndStatType)
	m[attributes.AtkSpd] = 0.15
	c.AddStatMod(character.StatMod{
		Base:         modifier.NewBaseWithHitlag(c2Key, burstDuration),
		AffectedStat: attributes.AtkSpd,
		Amount: func() []float64 {
			return m
		},
	})
}

func (c *char) c4() {
	c.AddReactBonusMod(character.ReactBonusMod{
		Base: modifier.NewBase("kaveh-c4", -1),
		Amount: func(ai info.AttackInfo) float64 {
			if ai.AttackTag == attacks.AttackTagBloom {
				return 0.6
			}
			return 0
		},
	})
}

func (c *char) c6() {
	c.Core.Events.Subscribe(event.OnEnemyHit, func(args ...any) {
		atk := args[1].(*info.AttackEvent)
		if atk.Info.ActorIndex != c.Index() {
			return
		}
		if atk.Info.AttackTag != attacks.AttackTagNormal &&
			atk.Info.AttackTag != attacks.AttackTagExtra &&
			atk.Info.AttackTag != attacks.AttackTagPlunge {
			return
		}
		t, ok := args[0].(*enemy.Enemy)
		if !ok {
			return
		}

		if !c.StatusIsActive(burstKey) {
			return
		}
		if c.StatusIsActive(c6ICDKey) {
			return
		}

		c.AddStatus(c6ICDKey, 180, false)

		ai := info.AttackInfo{
			Abil:             "Pairidaeza's Dreams (C6)",
			ActorIndex:       c.Index(),
			AttackTag:        attacks.AttackTagNone,
			ICDTag:           attacks.ICDTagNone,
			ICDGroup:         attacks.ICDGroupDefault,
			StrikeType:       attacks.StrikeTypeDefault,
			Element:          attributes.Dendro,
			Durability:       25,
			Mult:             0.618,
			HitlagFactor:     0.01,
			HitlagHaltFrames: 0.09 * 60,
		}
		ap := combat.NewCircleHitOnTarget(t, nil, 4)
		// delay is an estimate
		c.Core.QueueAttack(ai, ap, 0, 0.3*60)
		c.QueueCharTask(func() { c.ruptureDendroCores(ap) }, 0.3*60)
	}, "kaveh-c6")
}
