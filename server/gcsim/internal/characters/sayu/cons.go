package sayu

import (
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

// C2:
// Yoohoo Art: Fuuin Dash gains the following effects:
// DMG of Fuufuu Whirlwind Kick in Press Mode increased by 3.3%.
// Every 0.5s in the Fuufuu Windwheel state will increase the DMG of this Fuufuu
// Whirlwind Kick by 3.3%. The maximum DMG increase possible through this method
// is 66%.
func (c *char) c2() {
	m := make([]float64, attributes.EndStatType)
	c.AddAttackMod(character.AttackMod{
		Base: modifier.NewBase("sayu-c2", -1),
		Amount: func(atk *info.AttackEvent, _ info.Target) []float64 {
			if atk.Info.ActorIndex != c.Index() {
				return nil
			}
			if atk.Info.AttackTag != attacks.AttackTagElementalArt {
				return nil
			}
			m[attributes.DmgP] = c.c2Bonus
			return m
		},
	})
}
