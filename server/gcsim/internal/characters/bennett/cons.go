package bennett

import (
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func (c *char) c2() {
	m := make([]float64, attributes.EndStatType)
	m[attributes.ER] = .3

	c.AddStatMod(character.StatMod{
		Base:         modifier.NewBase("bennett-c2", -1),
		AffectedStat: attributes.ER,
		Amount: func() []float64 {
			if c.CurrentHPRatio() < 0.7 {
				return m
			}
			return nil
		},
	})
}
