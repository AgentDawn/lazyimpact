package yaoyao

import (
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/combat"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/core/player/character"
	"lazyimpact/gcsim/pkg/modifier"
)

const (
	c1ICDkey        = "yaoyao-c1-stam-icd"
	c2ICDkey        = "yaoyao-c2-icd"
	c6MegaRadishRad = 4.0
	c6HealMsg       = "Radish C6"
)

func (c *char) c1() {
	m := make([]float64, attributes.EndStatType)
	m[attributes.DendroP] = 0.15
	active := c.Core.Player.ActiveChar()
	active.AddStatMod(character.StatMod{
		Base:         modifier.NewBase("yaoyao-c1", 8*60),
		AffectedStat: attributes.DendroP,
		Amount: func() []float64 {
			return m
		},
	})
	if c.StatusIsActive(c1ICDkey) {
		return
	}
	c.Core.Player.RestoreStam(15)
	c.AddStatus(c1ICDkey, 5*60, false)
}

func (c *char) makeC2CB() info.AttackCBFunc {
	if c.Base.Cons < 2 {
		return nil
	}
	if !c.StatusIsActive(burstKey) {
		return nil
	}

	return func(a info.AttackCB) {
		if a.Target.Type() != info.TargettableEnemy {
			return
		}
		if c.StatusIsActive(c2ICDkey) {
			return
		}
		c.AddEnergy("yaoyao-c2", 3)
		c.AddStatus(c2ICDkey, 0.8*60, false)
	}
}

func (c *char) c4() {
	m := make([]float64, attributes.EndStatType)
	m[attributes.EM] = c.MaxHP() * 0.003
	if m[attributes.EM] > 120 {
		m[attributes.EM] = 120
	}
	c.AddStatMod(character.StatMod{
		Base:         modifier.NewBaseWithHitlag("yaoyao-c4", 8.8*60),
		AffectedStat: attributes.EM,
		Extra:        true,
		Amount: func() []float64 {
			return m
		},
	})
}

func (yg *yuegui) c6(target info.Point) {
	ai := info.AttackInfo{
		ActorIndex:         yg.c.Index(),
		Abil:               "Mega Radish",
		AttackTag:          attacks.AttackTagNone,
		ICDTag:             attacks.ICDTagNone,
		ICDGroup:           attacks.ICDGroupDefault,
		StrikeType:         attacks.StrikeTypeDefault,
		Element:            attributes.Dendro,
		Durability:         25,
		Mult:               0.75,
		CanBeDefenseHalted: true,
		IsDeployable:       true,
	}
	hi := info.HealInfo{
		Caller:  yg.c.Index(),
		Message: c6HealMsg,
		Src:     yg.c.MaxHP() * 0.075,
		Bonus:   yg.c.Stat(attributes.Heal),
	}

	c6MegaRadishAoE := combat.NewCircleHitOnTarget(target, nil, c6MegaRadishRad)
	yg.Core.Tasks.Add(yg.c.heal(c6MegaRadishAoE, hi), c6TravelDelay)
	yg.Core.QueueAttackWithSnap(ai, yg.snap, c6MegaRadishAoE, c6TravelDelay)
}
