package common

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/action"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/glog"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/model"
)

type Sacrificial struct {
	Index int
	data  *model.WeaponData
}

func (s *Sacrificial) SetIndex(idx int)        { s.Index = idx }
func (s *Sacrificial) Init() error             { return nil }
func (s *Sacrificial) Data() *model.WeaponData { return s.data }

func NewSacrificial(data *model.WeaponData) *Sacrificial {
	return &Sacrificial{data: data}
}

func (s *Sacrificial) NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	r := p.Refine

	const icdKey = "sacrificial-cd"

	prob := 0.3 + float64(r)*0.1

	cd := (34 - r*4) * 60

	if r >= 4 {
		cd = (19 - (r-4)*3) * 60
	}

	c.Events.Subscribe(event.OnEnemyDamage, func(args ...any) {
		atk := args[1].(*info.AttackEvent)
		dmg := args[2].(float64)
		if atk.Info.ActorIndex != char.Index() {
			return
		}
		if c.Player.Active() != char.Index() {
			return
		}
		if atk.Info.AttackTag != attacks.AttackTagElementalArt {
			return
		}
		if char.StatusIsActive(icdKey) {
			return
		}
		if char.Cooldown(action.ActionSkill) == 0 {
			return
		}
		if dmg == 0 {
			return
		}
		if c.Rand.Float64() < prob {
			char.ResetActionCooldown(action.ActionSkill)
			char.AddStatus(icdKey, cd, true)
			c.Log.NewEvent("sacrificial proc'd", glog.LogWeaponEvent, char.Index())
		}
	}, fmt.Sprintf("sac-%v", char.Base.Key.String()))

	return s, nil
}
