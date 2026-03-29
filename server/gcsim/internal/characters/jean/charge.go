package jean

import (
	"lazyimpact/gcsim/internal/frames"
	"lazyimpact/gcsim/pkg/core/action"
	"lazyimpact/gcsim/pkg/core/attacks"
	"lazyimpact/gcsim/pkg/core/attributes"
	"lazyimpact/gcsim/pkg/core/combat"
	"lazyimpact/gcsim/pkg/core/info"
)

var chargeFrames []int

const chargeHitmark = 36

func init() {
	chargeFrames = frames.InitAbilSlice(57)
	chargeFrames[action.ActionBurst] = 56
	chargeFrames[action.ActionDash] = chargeHitmark
	chargeFrames[action.ActionJump] = chargeHitmark
	chargeFrames[action.ActionSwap] = 39
}

// CA has no special interaction with her kit
func (c *char) ChargeAttack(p map[string]int) (action.Info, error) {
	ai := info.AttackInfo{
		ActorIndex: c.Index(),
		Abil:       "Charge",
		AttackTag:  attacks.AttackTagExtra,
		ICDTag:     attacks.ICDTagNormalAttack,
		ICDGroup:   attacks.ICDGroupDefault,
		StrikeType: attacks.StrikeTypeSlash,
		Element:    attributes.Physical,
		Durability: 25,
		Mult:       charge[c.TalentLvlAttack()],
	}

	c.Core.QueueAttack(
		ai,
		combat.NewCircleHitOnTargetFanAngle(
			c.Core.Combat.Player(),
			info.Point{Y: 1},
			1.8,
			160,
		),
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
