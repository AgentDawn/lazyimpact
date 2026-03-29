package whiteiron

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/enemy"
)

func init() {
	core.RegisterWeaponFunc(keys.WhiteIronGreatsword, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

// Defeating an opponent restores 8/10/12/14/16% HP.
func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	c.Events.Subscribe(event.OnTargetDied, func(args ...any) {
		_, ok := args[0].(*enemy.Enemy)
		// ignore if not an enemy
		if !ok {
			return
		}
		atk := args[1].(*info.AttackEvent)
		// don't proc if someone else defeated the enemy
		if atk.Info.ActorIndex != char.Index() {
			return
		}
		// don't proc if off-field
		if c.Player.Active() != char.Index() {
			return
		}
		// heal
		c.Player.Heal(info.HealInfo{
			Type:    info.HealTypePercent,
			Message: "White Iron Greatsword (Proc)",
			Src:     0.06 + float64(r)*0.02,
		})
	}, fmt.Sprintf("whiteirongreatsword-%v", char.Base.Key.String()))

	return w, nil
}
