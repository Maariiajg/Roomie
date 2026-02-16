package com.roomie.persistence.specifications;

import org.springframework.data.jpa.domain.Specification;

import com.roomie.persistence.entities.Piso;

public class PisoSpecification {

    public static Specification<Piso> precioMayorOIgual(Double min) {
        return (root, query, criteriaBuilder) ->
                min == null ? null :
                        criteriaBuilder.greaterThanOrEqualTo(root.get("precioMes"), min);
    }

    public static Specification<Piso> precioMenorOIgual(Double max) {
        return (root, query, criteriaBuilder) ->
                max == null ? null :
                        criteriaBuilder.lessThanOrEqualTo(root.get("precioMes"), max);
    }

    public static Specification<Piso> tieneGaraje(Boolean garaje) {
        return (root, query, cb) ->
                garaje == null ? null :
                        cb.equal(root.get("garaje"), garaje);
    }

    public static Specification<Piso> permiteAnimales(Boolean animales) {
        return (root, query, cb) ->
                animales == null ? null :
                        cb.equal(root.get("animales"), animales);
    }

    public static Specification<Piso> tieneWifi(Boolean wifi) {
        return (root, query, cb) ->
                wifi == null ? null :
                        cb.equal(root.get("wifi"), wifi);
    }

    public static Specification<Piso> permiteTabaco(Boolean tabaco) {
        return (root, query, cb) ->
                tabaco == null ? null :
                        cb.equal(root.get("tabaco"), tabaco);
    }
}