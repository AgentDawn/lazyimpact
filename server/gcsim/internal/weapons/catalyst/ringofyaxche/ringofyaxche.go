package ringofyaxche

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterWeaponFunc(keys.RingOfYaxche, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

// Using an Elemental Skill grants the Jade-Forged Crown effect:
// Every 1,000 Max HP will increase the Normal Attack DMG
// dealt by the equipping character by 1% for 10s.
// Normal Attack DMG can be increased this way by a maximum of 32%.
func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	buffBy := 0.005 + 0.001*float64(r)
	maxBuff := 0.12 + 0.04*float64(r)

	c.Events.Subscribe(event.OnSkill, func(args ...any) {
		if c.Player.Active() != char.Index() {
			return
		}

		buffAmt := min(maxBuff, char.MaxHP()*0.001*buffBy)
		m := make([]float64, attributes.EndStatType)
		char.AddAttackMod(character.AttackMod{
			Base: modifier.NewBase("ring-of-yaxche", 10*60),
			Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
				if atk.Info.AttackTag != attacks.AttackTagNormal {
					return nil
				}
				m[attributes.DmgP] = buffAmt
				return m
			},
		})
	}, fmt.Sprintf("ring-of-yaxche-%v", char.Base.Key.String()))

	return w, nil
}
