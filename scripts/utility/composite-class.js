export default function CompositeClass(base, ...mixins) {
    for (let mixin of mixins)
        base = mixin(base)
    return base
}