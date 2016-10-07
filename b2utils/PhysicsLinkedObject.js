"use strict";
var THREE = require("three");
var _1 = require("./");
/**
 * Base class for an object that has three.js visuals and a Box2D body.
 * Visual elements should be parented to 'this.transform'. The position of
 * 'this.transform' is automatically updated to match the body.
 */
var PhysicsLinkedObject = (function () {
    function PhysicsLinkedObject(body) {
        this.transform = new THREE.Object3D();
        _1.b2Utils.AllObjects.push(this);
        if (body) {
            this.body = body;
            this.body.ownerObject = this;
        }
    }
    /**
     * Destroys this object.
     */
    PhysicsLinkedObject.prototype.destroy = function () {
        if (this.transform && this.transform.parent) {
            this.transform.parent.remove(this.transform);
            delete this.transform;
        }
        var index = _1.b2Utils.AllObjects.indexOf(this);
        if (index >= 0) {
            _1.b2Utils.AllObjects.splice(index, 1);
        }
        this.destroyBody();
    };
    /**
     * Destroys the body associated with this object.
     */
    PhysicsLinkedObject.prototype.destroyBody = function () {
        if (this.body) {
            this.body.GetWorld().DestroyBody(this.body);
            this.body = undefined;
        }
    };
    /**
     * Updates this object once per frame.
     */
    PhysicsLinkedObject.prototype.update = function (deltaSec) {
        this.syncTransformToBody();
    };
    /**
     * Moves the THREE transform to match the body position.
     */
    PhysicsLinkedObject.prototype.syncTransformToBody = function () {
        if (this.body) {
            var physicsPos = this.body.GetPosition();
            this.transform.position.set(physicsPos.x * _1.b2Utils.B2_SCALE, physicsPos.y * _1.b2Utils.B2_SCALE, this.transform.position.z);
            this.transform.rotation.z = this.body.GetAngle();
        }
    };
    /**
     * Moves the body position to match the THREE transform.
     */
    PhysicsLinkedObject.prototype.syncBodyToTransform = function () {
        if (this.body) {
            _1.b2Utils.tempVector2.x = this.transform.position.x / _1.b2Utils.B2_SCALE;
            _1.b2Utils.tempVector2.y = this.transform.position.y / _1.b2Utils.B2_SCALE;
            this.body.SetPositionAndAngle(_1.b2Utils.tempVector2, this.transform.rotation.z);
        }
    };
    /**
     * Applies the specified impulse to the center of the body, but does not allow it to
     * increase the velocity above 'maxSpeed'. If the velocity is already above that, it can stay there.
     * @param {Box2D.b2Vec2} impulse
     * @param {Number} maxSpeed
     */
    PhysicsLinkedObject.prototype.applyLinearImpulseWithVelocityCap = function (impulse, maxSpeed) {
        if (impulse.x == 0 && impulse.y == 0)
            return;
        var velocity = this.body.GetLinearVelocity();
        var velocityLength = velocity.Length();
        this.body.ApplyImpulse(impulse, this.body.GetPosition());
        this.limitSpeed(Math.max(maxSpeed, velocityLength));
    };
    /**
     * Reduces the object's velocity to be no greater than the specified speed.
     * @param {Number} maxSpeed
     */
    PhysicsLinkedObject.prototype.limitSpeed = function (maxSpeed) {
        var postVelocity = this.body.GetLinearVelocity();
        var postVelocityLength = postVelocity.Length();
        if (postVelocityLength > maxSpeed) {
            postVelocity.x = maxSpeed * postVelocity.x / postVelocityLength;
            postVelocity.y = maxSpeed * postVelocity.y / postVelocityLength;
            this.body.SetLinearVelocity(postVelocity);
        }
    };
    /**
     * Called by box2d when this object starts touching another.
     * You cannot create or destroy bodies in here.
     * @param {Box2D.b2Contact} contact
     * @param {Box2D.b2Fixture} otherFixture
     */
    PhysicsLinkedObject.prototype.onBeginContact = function (contact, otherFixture) {
    };
    /**
     * Called by box2d when this object stops touching another.
     * You cannot create or destroy bodies in here.
     * @param {Box2D.b2Contact} contact
     * @param {Box2D.b2Fixture} otherFixture
     */
    PhysicsLinkedObject.prototype.onEndContact = function (contact, otherFixture) {
    };
    /**
     * Called by box2d each frame this body is touching another body, before the response is calculated.
     * The response can be disabled here.
     * You cannot create or destroy bodies in here.
     * @param {Box2D.b2Contact} contact
     * @param {Box2D.b2Manifold} oldManifold
     * @param {Box2D.b2Fixture} otherFixture
     */
    PhysicsLinkedObject.prototype.onPreSolve = function (contact, oldManifold, otherFixture) {
    };
    /**
     * Called by box2d each frame this body is touching another body, after the response is calculated.
     * You cannot create or destroy bodies in here.
     * @param {Box2D.b2Contact} contact
     * @param {Box2D.b2Impulse} impulse
     * @param {Box2D.b2Fixture} otherFixture
     */
    PhysicsLinkedObject.prototype.onPostSolve = function (contact, impulse, otherFixture) {
    };
    return PhysicsLinkedObject;
}());
exports.PhysicsLinkedObject = PhysicsLinkedObject;
;
