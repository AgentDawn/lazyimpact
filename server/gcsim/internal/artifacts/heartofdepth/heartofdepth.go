package heartofdepth

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
	core.RegisterSetFunc(keys.HeartOfDepth, NewSet)
}

type Set struct {
	key   string
	Index int
	Count int
}

func (s *Set) SetIndex(idx int) { s.Index = idx }
func (s *Set) GetCount() int    { return s.Count }
func (s *Set) Init() error      { return nil }

func NewSet(c *core.Core, char *character.CharWrapper, count int, param map[string]int) (info.Set, error) {
	s := Set{Count: count}
	s.key = fmt.Sprintf("%v-hod-4pc", char.Base.Key.String())
	buffDuration := 900 // 15s * 60

	if count >= 2 {
		m := make([]float64, attributes.EndStatType)
		m[attributes.HydroP] = 0.15
		char.AddStatMod(character.StatMod{
			Base:         modifier.NewBase("hod-2pc", -1),
			AffectedStat: attributes.HydroP,
			Amount: func() []float64 {
				return m
			},
		})
	}

	if count >= 4 {
		m := make([]float64, attributes.EndStatType)
		m[attributes.DmgP] = 0.30

		// TODO: this used to be on Post, need to be checked
		c.Events.Subscribe(event.OnSkill, func(args ...any) {
			if c.Player.Active() != char.Index() {
				return
			}
			// add stat mod here
			char.AddAttackMod(character.AttackMod{
				Base: modifier.NewBaseWithHitlag("hod-4pc", buffDuration),
				Amount: func(atk *info.AttackEvent, t info.Target) []float64 {
					if atk.Info.AttackTag != attacks.AttackTagNormal && atk.Info.AttackTag != attacks.AttackTagExtra {
						return nil
					}
					return m
				},
			})
		}, s.key)
	}

	return &s, nil
}
