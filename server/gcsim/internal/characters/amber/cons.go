package amber

import (
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

// C2
// Explosion via manual detonation deals 200% additional DMG.
func (c *char) c2() {
	m := make([]float64, attributes.EndStatType)
	m[attributes.DmgP] = 2
	c.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("amber-c2", -1),
		Amount: func(atk *info.AttackEvent, _ info.Target) []float64 {
			if atk.Info.AttackTag != attacks.AttackTagElementalArt {
				return nil
			}
			if atk.Info.Abil != manualExplosionAbil {
				return nil
			}
			return m
		},
	})
}
