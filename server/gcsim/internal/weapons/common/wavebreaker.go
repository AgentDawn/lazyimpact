package common

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/glog"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/model"
	"lazyimpact/gcsim/pkg/modifier"
)

type Wavebreaker struct {
	Index int
	data  *model.WeaponData
}

func (w *Wavebreaker) SetIndex(idx int)        { w.Index = idx }
func (w *Wavebreaker) Init() error             { return nil }
func (w *Wavebreaker) Data() *model.WeaponData { return w.data }

func NewWavebreaker(data *model.WeaponData) *Wavebreaker {
	return &Wavebreaker{data: data}
}

func (w *Wavebreaker) NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	r := p.Refine

	per := 0.09 + 0.03*float64(r)
	maxBonus := 0.3 + 0.1*float64(r)

	var amt float64

	c.Events.Subscribe(event.OnInitialize, func(args ...any) {
		var energy float64

		for _, x := range c.Player.Chars() {
			energy += x.EnergyMax
		}

		amt = energy * per / 100
		if amt > maxBonus {
			amt = maxBonus
		}
		c.Log.NewEvent("wavebreaker dmg calc", glog.LogWeaponEvent, char.Index()).
			Write("total", energy).
			Write("per", per).
			Write("max", maxBonus).
			Write("amt", amt)
		m := make([]float64, attributes.EndStatType)
		m[attributes.DmgP] = amt
		char.AddAttackMod(character.AttackMod{
			Base: modifier.NewBase("wavebreaker", -1),
			Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
				if atk.Info.AttackTag == attacks.AttackTagElementalBurst {
					return m
				}
				return nil
			},
		})
	}, fmt.Sprintf("wavebreaker-%v", char.Base.Key.String()))

	return w, nil
}
