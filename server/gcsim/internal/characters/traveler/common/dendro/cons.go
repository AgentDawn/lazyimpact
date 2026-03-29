package dendro

import (
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/combat"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/glog"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func (c *Traveler) c1cb() func(a info.AttackCB) {
	return func(a info.AttackCB) {
		if a.Target.Type() != info.TargettableEnemy {
			return
		}
		if c.skillC1 {
			c.AddEnergy("dmc-c1", 3.5)
			c.skillC1 = false
		}
	}
}

func (c *Traveler) c4() {
	c.burstOverflowingLotuslight += 5
	if c.burstOverflowingLotuslight > 10 {
		c.burstOverflowingLotuslight = 10
	}
	c.Core.Log.NewEvent("dmc-c4-triggered", glog.LogCharacterEvent, c.Index())
}

// Gets removed on swap - from Kolibri
func (c *Traveler) c6Init() {
	c.Core.Events.Subscribe(event.OnCharacterSwap, func(args ...any) {
		prev := args[0].(int)
		prevChar := c.Core.Player.ByIndex(prev)
		prevChar.DeleteStatMod("dmc-c6")
	}, "dmc-c6-remove")
}

func (c *Traveler) c6Buff(delay int) {
	m := make([]float64, attributes.EndStatType)
	// A1/C6 buff ticks every 0.3s and applies for 1s. probably counting from gadget spawn - from Kolibri
	c.Core.Tasks.Add(func() {
		if c.Core.Status.Duration(burstKey) <= 0 {
			return
		}
		if !c.Core.Combat.Player().IsWithinArea(combat.NewCircleHitOnTarget(c.burstPos, nil, c.burstRadius)) {
			return
		}
		m[attributes.DendroP] = 0.12
		if c.burstTransfig != attributes.NoElement {
			switch c.burstTransfig {
			case attributes.Hydro:
				m[attributes.HydroP] = 0.12
			case attributes.Electro:
				m[attributes.ElectroP] = 0.12
			case attributes.Pyro:
				m[attributes.PyroP] = 0.12
			}
		}
		active := c.Core.Player.ActiveChar()
		active.AddStatMod(character.StatMod{
			Base: modifier.NewBaseWithHitlag("dmc-c6", 60),
			Amount: func() []float64 {
				return m
			},
		})
	}, delay)
}
