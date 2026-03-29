package ayato

import (
	"errors"

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
	chargeFrames = frames.InitAbilSlice(55)
	chargeFrames[action.ActionDash] = chargeHitmark
	chargeFrames[action.ActionJump] = chargeHitmark
	chargeFrames[action.ActionSwap] = 53
}

func (c *char) ChargeAttack(p map[string]int) (action.Info, error) {
	if c.StatusIsActive(skillBuffKey) {
		return action.Info{}, errors.New("charged attack called in skill state")
	}
	ai := info.AttackInfo{
		Abil:       "Charge",
		ActorIndex: c.Index(),
		AttackTag:  attacks.AttackTagExtra,
		ICDTag:     attacks.ICDTagExtraAttack,
		ICDGroup:   attacks.ICDGroupPoleExtraAttack,
		StrikeType: attacks.StrikeTypeSlash,
		Element:    attributes.Physical,
		Durability: 25,
		Mult:       ca[c.TalentLvlAttack()],
	}

	c.Core.QueueAttack(
		ai,
		combat.NewCircleHit(
			c.Core.Combat.Player(),
			c.Core.Combat.PrimaryTarget(),
			nil,
			0.8,
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
