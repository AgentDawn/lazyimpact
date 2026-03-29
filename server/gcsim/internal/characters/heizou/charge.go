package heizou

import (
	"lazyimpact/gcsim/internal/frames"
	"lazyimpact/gcsim/pkg/core/action"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/combat"
	"lazyimpact/gcsim/pkg/core/info"
)

var chargeFrames []int

const chargeHitmark = 24

func init() {
	chargeFrames = frames.InitAbilSlice(46)
	chargeFrames[action.ActionDash] = chargeHitmark
	chargeFrames[action.ActionJump] = chargeHitmark
	chargeFrames[action.ActionAttack] = 38
	chargeFrames[action.ActionSkill] = 38
	chargeFrames[action.ActionBurst] = 38
}

func (c *char) ChargeAttack(p map[string]int) (action.Info, error) {
	ai := info.AttackInfo{
		ActorIndex:         c.Index(),
		Abil:               "Charge Attack",
		AttackTag:          attacks.AttackTagExtra,
		ICDTag:             attacks.ICDTagNone,
		ICDGroup:           attacks.ICDGroupDefault,
		StrikeType:         attacks.StrikeTypeDefault,
		Element:            attributes.Anemo,
		Durability:         25,
		Mult:               charge[c.TalentLvlAttack()],
		HitlagFactor:       0.01,
		HitlagHaltFrames:   0.09 * 60,
		CanBeDefenseHalted: false,
	}

	// TODO: check snapshot delay
	c.Core.QueueAttack(
		ai,
		combat.NewBoxHitOnTarget(c.Core.Combat.Player(), info.Point{Y: -1.2}, 2.8, 3.6),
		chargeHitmark,
		chargeHitmark,
	)
	return action.Info{
		Frames:          frames.NewAbilFunc(chargeFrames),
		AnimationLength: chargeFrames[action.InvalidAction],
		CanQueueAfter:   chargeHitmark,
		State:           action.ChargeAttackState,
	}, nil
}
