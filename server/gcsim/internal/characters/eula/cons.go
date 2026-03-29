package eula

import (
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/enemy"
	"lazyimpact/gcsim/pkg/modifier"
)

func (c *char) c4() {
	if c.Core.Combat.DamageMode {
		m := make([]float64, attributes.EndStatType)
		m[attributes.DmgP] = 0.25
		c.AddAttackMod(character.AttackMod{
			Base: modifier.NewBase("eula-c4", -1),
			Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
				if atk.Info.Abil != burstInitialAbil {
					return nil
				}
				if !c.Core.Combat.DamageMode {
					return nil
				}
				x, ok := t.(*enemy.Enemy)
				if !ok {
					return nil
				}
				if x.HP()/x.MaxHP() >= 0.5 {
					return nil
				}
				return m
			},
		})
	}
}
