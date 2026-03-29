package fischl

import (
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/combat"
	"lazyimpact/gcsim/pkg/core/info"
)

func (c *char) c6Wave() {
	ai := info.AttackInfo{
		ActorIndex: c.Index(),
		Abil:       "Evernight Raven (C6)",
		AttackTag:  attacks.AttackTagElementalArt,
		ICDTag:     attacks.ICDTagElementalArt,
		ICDGroup:   attacks.ICDGroupFischl,
		StrikeType: attacks.StrikeTypePierce,
		Element:    attributes.Electro,
		Durability: 25,
		Mult:       0.3,
	}

	// C6 uses Oz Snapshot
	c.Core.QueueAttackWithSnap(
		ai,
		c.ozSnapshot.Snapshot,
		combat.NewBoxHit(
			c.Core.Combat.Player(),
			c.Core.Combat.PrimaryTarget(),
			info.Point{Y: -1},
			0.1,
			1,
		),
		c.ozTravel,
	)
}
