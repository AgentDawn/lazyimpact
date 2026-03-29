package freminet

import (
	"strings"

	"lazyimpact/gcsim/pkg/core/action"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/glog"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/enemy"
	"lazyimpact/gcsim/pkg/modifier"
)

const (
	a4Key = "freminet-a4-buff"
)

func (c *char) a1() {
	if c.Base.Ascension < 1 || c.skillStacks == 4 {
		return
	}
	c.ReduceActionCooldown(action.ActionSkill, 60)
}

func (c *char) a4() {
	if c.Base.Ascension < 4 {
		return
	}

	a4BuffFunc := func(args ...any) {
		if _, ok := args[0].(*enemy.Enemy); !ok {
			return
		}

		atk := args[1].(*info.AttackEvent)
		if atk.Info.ActorIndex != c.Index() {
			return
		}

		buff := make([]float64, attributes.EndStatType)
		buff[attributes.DmgP] = 0.4

		c.AddAttackMod(character.AttackMod{
			Base: modifier.NewBaseWithHitlag(a4Key, 5*60),
			Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
				if !strings.HasPrefix(atk.Info.Abil, pressureBaseName) {
					return nil
				}
				return buff
			},
		})

		c.Core.Log.NewEvent("freminet a4 proc", glog.LogCharacterEvent, c.Index())
	}

	c.Core.Events.Subscribe(event.OnShatter, a4BuffFunc, "freminet-a4")
}
