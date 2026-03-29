package noelle

import (
	"lazyimpact/gcsim/pkg/core/action"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func (c *char) c2() {
	if c.Base.Cons < 2 {
		return
	}

	m := make([]float64, attributes.EndStatType)
	m[attributes.DmgP] = .15
	c.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("noelle-c2-dmg", -1),
		Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
			if atk.Info.AttackTag == attacks.AttackTagExtra {
				return m
			}
			return nil
		},
	})

	c.Core.Player.AddStamPercentMod("noelle-c2-stam", -1, func(a action.Action) (float64, bool) {
		if a == action.ActionCharge {
			return -.20, false
		}
		return 0, false
	})
}
