package beidou

import (
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

// A1 is not implemented:
// TODO: Counterattacking with Tidecaller at the precise moment when the character is hit grants the maximum DMG Bonus.

// Gain the following effects for 10s after unleashing Tidecaller with its maximum DMG Bonus:
// - DMG dealt by Normal and Charged Attacks is increased by 15%. ATK SPD of Normal and Charged Attacks is increased by 15%.
// TODO: - Greatly reduced delay before unleashing Charged Attacks.
func (c *char) a4() {
	if c.Base.Ascension < 4 {
		return
	}

	mDmg := make([]float64, attributes.EndStatType)
	mDmg[attributes.DmgP] = .15
	c.AddAttackMod(character.AttackMod{
		Base: modifier.NewBaseWithHitlag("beidou-a4-dmg", 600),
		Amount: func(atk *info.AttackEvent, _ info.Target) []float64 {
			if atk.Info.AttackTag != attacks.AttackTagNormal && atk.Info.AttackTag != attacks.AttackTagExtra {
				return nil
			}
			return mDmg
		},
	})

	mAtkSpd := make([]float64, attributes.EndStatType)
	mAtkSpd[attributes.AtkSpd] = .15
	c.AddStatMod(character.StatMod{
		Base:         modifier.NewBaseWithHitlag("beidou-a4-atkspd", 600),
		AffectedStat: attributes.AtkSpd,
		Amount: func() []float64 {
			return mAtkSpd
		},
	})
}
