package common

import (
	"fmt"

	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/event"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/enemy"
	"lazyimpact/gcsim/pkg/model"
	"lazyimpact/gcsim/pkg/modifier"
)

type Blackcliff struct {
	Index int
	data  *model.WeaponData
}

func (b *Blackcliff) SetIndex(idx int)        { b.Index = idx }
func (b *Blackcliff) Init() error             { return nil }
func (b *Blackcliff) Data() *model.WeaponData { return b.data }

func NewBlackcliff(data *model.WeaponData) *Blackcliff {
	return &Blackcliff{
		data: data,
	}
}

func (b *Blackcliff) NewWeapon(c *core.Core, char *character.CharWrapper, p info.WeaponProfile) (info.Weapon, error) {
	atkRefine := 0.09 + float64(p.Refine)*0.03
	index := 0
	stackKey := []string{
		"blackcliff-stack-1",
		"blackcliff-stack-2",
		"blackcliff-stack-3",
	}
	m := make([]float64, attributes.EndStatType)

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
		// add status to char given index
		char.AddStatus(stackKey[index], 1800, true)
		// update buff
		char.AddStatMod(character.StatMod{
			Base:         modifier.NewBaseWithHitlag("blackcliff", 1800),
			AffectedStat: attributes.ATKP,
			Amount: func() []float64 {
				count := 0
				for _, v := range stackKey {
					if char.StatusIsActive(v) {
						count++
					}
				}
				m[attributes.ATKP] = atkRefine * float64(count)
				return m
			},
		})
		index++
		if index == 3 {
			index = 0
		}
	}, fmt.Sprintf("blackcliff-%v", char.Base.Key.String()))

	return b, nil
}
