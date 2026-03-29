package twin

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/enemy"
	"lazyimpact/gcsim/pkg/modifier"
)

func init() {
	core.RegisterWeaponFunc(keys.TwinNephrite, NewWeapon)
}

type Weapon struct {
	Index int
}

func (w *Weapon) SetIndex(idx int) { w.Index = idx }
func (w *Weapon) Init() error      { return nil }

// Defeating an opponent increases Movement SPD and ATK by 12/14/16/18/20% for 15s.
func NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	w := &Weapon{}
	r := p.Refine

	m := make([]float64, attributes.EndStatType)
	m[attributes.ATKP] = 0.10 + float64(r)*0.02

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
		// add buff
		char.AddStatMod(character.StatMod{
			Base:         modifier.NewBaseWithHitlag("twinnephrite", 900), // 15s
			AffectedStat: attributes.ATKP,
			Amount: func() []float64 {
				return m
			},
		})
	}, fmt.Sprintf("twinnephrite-%v", char.Base.Key.String()))

	return w, nil
}
