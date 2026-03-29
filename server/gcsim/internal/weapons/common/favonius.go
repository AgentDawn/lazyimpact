package common

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/glog"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/model"
)

type Favonius struct {
	Index int
	data  *model.WeaponData
}

func (b *Favonius) SetIndex(idx int)        { b.Index = idx }
func (b *Favonius) Init() error             { return nil }
func (b *Favonius) Data() *model.WeaponData { return b.data }

func NewFavonius(data *model.WeaponData) *Favonius {
	return &Favonius{data: data}
}

func (b *Favonius) NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	const icdKey = "favonius-cd"

	prob := 0.50 + float64(p.Refine)*0.1
	cd := 810 - p.Refine*90

	c.Events.Subscribe(event.OnEnemyDamage, func(args ...any) {
		atk := args[1].(*info.AttackEvent)
		dmg := args[2].(float64)
		crit := args[3].(bool)
		if dmg == 0 {
			return
		}
		if !crit {
			return
		}
		if atk.Info.ActorIndex != char.Index() {
			return
		}
		if c.Player.Active() != char.Index() {
			return
		}
		if char.StatusIsActive(icdKey) {
			return
		}
		if c.Rand.Float64() > prob {
			return
		}
		c.Log.NewEvent("favonius proc'd", glog.LogWeaponEvent, char.Index())

		// TODO: used to be 80
		c.QueueParticle("favonius-"+char.Base.Key.String(), 3, attributes.NoElement, char.ParticleDelay)

		// adds a modifier to track icd; this should be fine since it's per char and not global
		char.AddStatus(icdKey, cd, true)
	}, fmt.Sprintf("favo-%v", char.Base.Key.String()))

	return b, nil
}
