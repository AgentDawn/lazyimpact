package lanyan

import (
	"lazyimpact/gcsim/internal/frames"
	"lazyimpact/gcsim/pkg/core/action"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/combat"
	"lazyimpact/gcsim/pkg/core/info"
)

var (
	burstFrames []int

	burstHitmarks = []int{30, 46, 51}
)

func init() {
	burstFrames = frames.InitAbilSlice(100) // Q - Jump
	burstFrames[action.ActionAttack] = 75
	burstFrames[action.ActionSkill] = 75
	burstFrames[action.ActionDash] = 72
	burstFrames[action.ActionSwap] = 75
}

func (c *char) Burst(p map[string]int) (action.Info, error) {
	ai := info.AttackInfo{
		ActorIndex: c.Index(),
		Abil:       "Lustrous Moonrise",
		AttackTag:  attacks.AttackTagElementalBurst,
		ICDTag:     attacks.ICDTagElementalBurst,
		ICDGroup:   attacks.ICDGroupDefault,
		StrikeType: attacks.StrikeTypeDefault,
		Element:    attributes.Anemo,
		Durability: 50,
		Mult:       burst[c.TalentLvlBurst()],
	}
	if c.Base.Ascension >= 4 {
		ai.FlatDmg = c.Stat(attributes.EM) * 7.74
	}

	ap := combat.NewCircleHitOnTarget(
		c.Core.Combat.PrimaryTarget(),
		nil,
		6.0,
	)
	for _, hitmark := range burstHitmarks {
		c.Core.QueueAttack(ai, ap, hitmark, hitmark)
	}

	c.SetCD(action.ActionBurst, 15*60)
	c.ConsumeEnergy(4)

	c.c4()

	return action.Info{
		Frames:          frames.NewAbilFunc(burstFrames),
		AnimationLength: burstFrames[action.InvalidAction],
		CanQueueAfter:   burstFrames[action.ActionDash],
		State:           action.BurstState,
	}, nil
}
