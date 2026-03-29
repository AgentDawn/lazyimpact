package anemo

import (
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/enemy"
	"lazyimpact/gcsim/pkg/modifier"
)

func (c *Traveler) c2() {
	m := make([]float64, attributes.EndStatType)
	m[attributes.ER] = .16

	c.AddStatMod(character.StatMod{
		Base:         modifier.NewBase("amc-c2", -1),
		AffectedStat: attributes.ER,
		Amount: func() []float64 {
			return m
		},
	})
}

func c6cb(ele attributes.Element) func(a info.AttackCB) {
	return func(a info.AttackCB) {
		e, ok := a.Target.(*enemy.Enemy)
		if !ok {
			return
		}
		e.AddResistMod(info.ResistMod{
			Base:  modifier.NewBaseWithHitlag("amc-c6-"+ele.String(), 600),
			Ele:   ele,
			Value: -0.20,
		})
	}
}
