package yaemiko

import (
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

// When Sesshou Sakura lightning hits opponents, the Electro DMG Bonus of all nearby party members is increased by 20% for 5s.
func (c *char) c4() {
	// TODO: does this trigger for yaemiko too? assuming it does
	for _, char := range c.Core.Player.Chars() {
		char.AddStatMod(character.StatMod{
			Base:         modifier.NewBaseWithHitlag("yaemiko-c4", 5*60),
			AffectedStat: attributes.ElectroP,
			Amount: func() []float64 {
				return c.c4buff
			},
		})
	}
}
