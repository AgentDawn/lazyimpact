package hacks

import (
	"lazyimpact/gcsim/pkg/core"
	"lazyimpact/gcsim/pkg/core/info"
	"lazyimpact/gcsim/pkg/reactable"
)

// TODO: place holder function for creating a reactable until we move off
// old reactable system entirely
func NewReactable(t info.Target, c *core.Core) info.Reactable {
	r := &reactable.Reactable{}
	r.Init(t, c)
	return r
}
