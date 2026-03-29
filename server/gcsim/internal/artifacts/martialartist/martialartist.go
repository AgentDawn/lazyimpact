package martialartist

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
	core.RegisterSetFunc(keys.MartialArtist, NewSet)
}

type Set struct {
	Index int
	Count int
}

func (s *Set) SetIndex(idx int) { s.Index = idx }
func (s *Set) GetCount() int    { return s.Count }
func (s *Set) Init() error      { return nil }

func NewSet(c *core.Core, char *character.CharWrapper, count int, param map[string]int) (info.Set, error) {
	s := Set{Count: count}

	// 2 Piece: Increases Normal Attack and Charged Attack DMG by 15%.
	if count >= 2 {
		m := make([]float64, attributes.EndStatType)
		m[attributes.DmgP] = 0.15
		char.AddAttackMod(character.AttackMod{
			Base: modifier.NewBase("martialartist-2pc", -1),
			Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
				if atk.Info.AttackTag != attacks.AttackTagNormal && atk.Info.AttackTag != attacks.AttackTagExtra {
					return nil
				}
				return m
			},
		})
	}
	// 4 Piece: After using Elemental Skill, increases Normal Attack and Charged Attack DMG by 25% for 8s.
	if count >= 4 {
		m := make([]float64, attributes.EndStatType)
		m[attributes.DmgP] = 0.25
		c.Events.Subscribe(event.OnSkill, func(args ...any) {
			// don't proc if someone else used a skill
			if c.Player.Active() != char.Index() {
				return
			}
			// add buff
			char.AddAttackMod(character.AttackMod{
				Base: modifier.NewBaseWithHitlag("martialartist-4pc", 480), // 8s
				Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
					if atk.Info.AttackTag != attacks.AttackTagNormal && atk.Info.AttackTag != attacks.AttackTagExtra {
						return nil
					}
					return m
				},
			})
		}, fmt.Sprintf("martialartist-4pc-%v", char.Base.Key.String()))
	}

	return &s, nil
}
