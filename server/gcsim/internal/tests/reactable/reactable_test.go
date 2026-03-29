package reactable_test

import (
	"time"

	"lazyimpact/gcsim/pkg/avatar"
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/keys"

	"lazyimpact/gcsim/pkg/enemy"
	"lazyimpact/gcsim/pkg/testhelper"
)

func init() {
	core.RegisterCharFunc(keys.TestCharDoNotUse, testhelper.NewChar)
	core.RegisterWeaponFunc(keys.DullBlade, testhelper.NewFakeWeapon)
}

func makeCore(trgCount int) (*core.Core, []*enemy.Enemy) {
	c, _ := core.New(core.Opt{
		Seed:  time.Now().Unix(),
		Debug: true,
	})
	a := avatar.New(c, info.Point{X: 0, Y: 0}, 1)
	c.Combat.SetPlayer(a)
	var trgs []*enemy.Enemy

	for range trgCount {
		e := enemy.New(c, info.EnemyProfile{
			Level:  100,
			Resist: make(map[attributes.Element]float64),
			Pos: info.Coord{
				X: 0,
				Y: 0,
				R: 1,
			},
		})
		trgs = append(trgs, e)
		c.Combat.AddEnemy(e)
	}

	for range 4 {
		p := info.CharacterProfile{}
		p.Base.Key = keys.TestCharDoNotUse
		p.Stats = make([]float64, attributes.EndStatType)
		p.StatsByLabel = make(map[string][]float64)
		p.Params = make(map[string]int)
		p.Sets = make(map[keys.Set]int)
		p.SetParams = make(map[keys.Set]map[string]int)
		p.Weapon.Params = make(map[string]int)
		p.Base.Element = attributes.Geo
		p.Weapon.Key = keys.DullBlade

		p.Stats[attributes.EM] = 100
		p.Base.Level = 90
		p.Base.MaxLevel = 90
		p.Talents = info.TalentProfile{Attack: 1, Skill: 1, Burst: 1}

		_, err := c.AddChar(p)
		if err != nil {
			panic(err)
		}
	}
	c.Player.SetActive(0)

	return c, trgs
}

func advanceCoreFrame(c *core.Core) {
	c.F++
	c.Tick()
}
